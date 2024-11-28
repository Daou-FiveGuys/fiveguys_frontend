/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: [
      'i.pinimg.com',
      'tjzk.replicate.delivery',
      'example.com',
      'another-image-source.com',
      'fal.media',
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*", // API 경로에 대해 설정
        headers: [
          { key: "Access-Control-Allow-Origin", value: "http://d2stuqjdxeqx1n.cloudfront.net" }, // 특정 도메인
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};
