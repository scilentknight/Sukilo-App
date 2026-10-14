const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "sukiloapi.globaltechsolution.com.np",
      },
      {
        protocol: "https",
        hostname: "sukiloapi.globaltechsolution.com.np",
      },
    ],
  },
};

export default nextConfig;
