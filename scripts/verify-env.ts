/**
 * @file verify-env.ts
 * @description 환경변수 검증 스크립트
 *
 * 모든 필수 환경변수가 설정되어 있는지 확인하는 스크립트입니다.
 *
 * 사용법:
 * - tsx scripts/verify-env.ts
 * - 또는: npm run verify:env
 *
 * 빌드 전에 실행하여 환경변수 설정을 확인할 수 있습니다.
 */

import { config } from "dotenv";
import {
  validateAllEnvVars,
  validateClerkEnv,
  validateSupabaseEnv,
  validateTourApiEnv,
  validateNaverMapEnv,
} from "../lib/utils/env";

// .env 파일 로드
config();

/**
 * 환경변수 검증 결과 출력
 */
function printValidationResult(
  name: string,
  result: { valid: boolean; missing: string[]; warnings: string[] }
) {
  console.log(`\n📋 ${name} 환경변수 검증:`);
  console.log("=".repeat(50));

  if (result.valid && result.warnings.length === 0) {
    console.log("✅ 모든 필수 환경변수가 설정되어 있습니다.");
  } else {
    if (result.missing.length > 0) {
      console.log("❌ 누락된 필수 환경변수:");
      result.missing.forEach((env) => {
        console.log(`   - ${env}`);
      });
    }

    if (result.warnings.length > 0) {
      console.log("⚠️  경고 (선택적 환경변수 또는 권장 사항):");
      result.warnings.forEach((warning) => {
        console.log(`   - ${warning}`);
      });
    }
  }
}

/**
 * 메인 함수
 */
function main() {
  console.log("🔍 환경변수 검증 시작...\n");

  // 각 카테고리별 검증
  const clerkResult = validateClerkEnv();
  const supabaseResult = validateSupabaseEnv();
  const tourApiResult = validateTourApiEnv();
  const naverMapResult = validateNaverMapEnv();

  printValidationResult("Clerk Authentication", clerkResult);
  printValidationResult("Supabase", supabaseResult);
  printValidationResult("한국관광공사 API", tourApiResult);
  printValidationResult("네이버 지도", naverMapResult);

  // 전체 검증 결과
  const allResult = validateAllEnvVars();

  console.log("\n" + "=".repeat(50));
  console.log("📊 전체 검증 결과:");
  console.log("=".repeat(50));

  if (allResult.valid) {
    console.log("✅ 모든 필수 환경변수가 설정되어 있습니다!");
    
    if (allResult.warnings.length > 0) {
      console.log("\n⚠️  선택적 환경변수 또는 권장 사항:");
      allResult.warnings.forEach((warning) => {
        console.log(`   - ${warning}`);
      });
      console.log("\n💡 경고 사항은 선택 사항이지만, 프로덕션 환경에서는 설정하는 것을 권장합니다.");
    }

    console.log("\n🚀 환경변수 설정이 완료되었습니다. 빌드를 진행할 수 있습니다.");
    process.exit(0);
  } else {
    console.log("❌ 일부 필수 환경변수가 누락되었습니다:");
    allResult.missing.forEach((env) => {
      console.log(`   - ${env}`);
    });

    if (allResult.warnings.length > 0) {
      console.log("\n⚠️  선택적 환경변수 또는 권장 사항:");
      allResult.warnings.forEach((warning) => {
        console.log(`   - ${warning}`);
      });
    }

    console.log("\n📝 .env.example 파일을 참고하여 누락된 환경변수를 설정해주세요.");
    console.log("📖 자세한 내용은 docs/ENV_SETUP.md를 참고하세요.");
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

export { main };

