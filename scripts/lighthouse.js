/**
 * @file lighthouse.js
 * @description Lighthouse 성능 측정 스크립트
 *
 * 주요 페이지의 Lighthouse 점수를 측정하고 결과를 저장합니다.
 *
 * 사용법:
 * - 개발 서버 실행 후: node scripts/lighthouse.js
 * - 또는: npm run lighthouse:measure
 *
 * 측정 페이지:
 * - / (홈페이지)
 * - /stats (통계 페이지)
 * - /places/[sample-contentId] (상세페이지 샘플)
 *
 * 목표 점수:
 * - Performance: > 80
 * - Accessibility: > 90
 * - Best Practices: > 90
 * - SEO: > 90
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'lighthouse-reports');

// 측정할 페이지 목록
const PAGES = [
  { name: 'homepage', path: '/' },
  { name: 'stats', path: '/stats' },
  // 상세페이지는 샘플 contentId 사용 (실제 존재하는 ID로 변경 필요)
  { name: 'detail', path: '/places/125266' },
];

/**
 * Lighthouse 옵션 설정
 */
function getLighthouseOptions() {
  return {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: undefined, // chromeLauncher가 설정
  };
}

/**
 * Lighthouse 측정 실행
 */
async function runLighthouse(url, pageName) {
  console.log(`\n🔍 Measuring ${pageName} (${url})...`);

  let chrome;
  try {
    // Chrome 실행
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
    });

    const options = {
      ...getLighthouseOptions(),
      port: chrome.port,
    };

    // Lighthouse 측정
    const runnerResult = await lighthouse(url, options);

    // 결과 저장
    const report = runnerResult.lhr;
    const scores = {
      performance: Math.round(report.categories.performance.score * 100),
      accessibility: Math.round(report.categories.accessibility.score * 100),
      'best-practices': Math.round(report.categories['best-practices'].score * 100),
      seo: Math.round(report.categories.seo.score * 100),
    };

    // HTML 리포트 저장
    const htmlReport = runnerResult.report;
    const outputPath = path.join(OUTPUT_DIR, `${pageName}-report.html`);
    fs.writeFileSync(outputPath, htmlReport);
    console.log(`✅ Report saved: ${outputPath}`);

    // 점수 출력
    console.log(`\n📊 Scores for ${pageName}:`);
    console.log(`   Performance: ${scores.performance}/100`);
    console.log(`   Accessibility: ${scores.accessibility}/100`);
    console.log(`   Best Practices: ${scores['best-practices']}/100`);
    console.log(`   SEO: ${scores.seo}/100`);

    // 목표 점수 확인
    const passed = 
      scores.performance >= 80 &&
      scores.accessibility >= 90 &&
      scores['best-practices'] >= 90 &&
      scores.seo >= 90;

    if (passed) {
      console.log(`   ✅ All scores meet the target!`);
    } else {
      console.log(`   ⚠️  Some scores are below target:`);
      if (scores.performance < 80) console.log(`      - Performance: ${scores.performance} < 80`);
      if (scores.accessibility < 90) console.log(`      - Accessibility: ${scores.accessibility} < 90`);
      if (scores['best-practices'] < 90) console.log(`      - Best Practices: ${scores['best-practices']} < 90`);
      if (scores.seo < 90) console.log(`      - SEO: ${scores.seo} < 90`);
    }

    return {
      pageName,
      url,
      scores,
      passed,
      reportPath: outputPath,
    };
  } catch (error) {
    console.error(`❌ Error measuring ${pageName}:`, error);
    return {
      pageName,
      url,
      error: error.message,
    };
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🚀 Starting Lighthouse measurements...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

  // 출력 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];

  // 각 페이지 측정
  for (const page of PAGES) {
    const url = `${BASE_URL}${page.path}`;
    const result = await runLighthouse(url, page.name);
    results.push(result);

    // 페이지 간 대기 (서버 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 전체 결과 요약
  console.log('\n📋 Summary:');
  console.log('='.repeat(50));
  
  const allPassed = results.every(r => r.passed !== false);
  const passedCount = results.filter(r => r.passed === true).length;
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.pageName}: Error - ${result.error}`);
    } else if (result.passed) {
      console.log(`✅ ${result.pageName}: All scores passed`);
    } else {
      console.log(`⚠️  ${result.pageName}: Some scores below target`);
    }
  });

  console.log('='.repeat(50));
  console.log(`\n✅ Passed: ${passedCount}/${results.length} pages`);
  
  if (allPassed) {
    console.log('🎉 All pages meet the performance targets!');
    process.exit(0);
  } else {
    console.log('⚠️  Some pages need optimization. Check the reports for details.');
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runLighthouse, main };

