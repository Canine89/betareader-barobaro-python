import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 미리보기 띠는 75, 크게 보기는 90 (Next 16은 목록에 없는 화질 값을 거부한다)
    qualities: [75, 90],
  },
};

export default nextConfig;
