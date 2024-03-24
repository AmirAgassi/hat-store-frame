import { fetchMetadata } from "frames.js/next";

export async function generateMetadata() {
  return {
    title: "My page",
    other: await fetchMetadata(
      new URL("/frames", process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
    ),
  };
}

export default function Home(props) {
  return <div>My Pagee</div>;
}