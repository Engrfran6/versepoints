// "use client";

// export default function BackgroundVideo() {
//   return (
//     <video autoPlay loop muted playsInline className="w-full h-full object-cover">
//       <source src="/video.mp4" type="video/mp4" />
//     </video>
//   );
// }

"use client";

export default function BackgroundVideo() {
  return (
    <div className="absolute inset-0 z-0">
      <video autoPlay loop muted playsInline className="w-full h-full object-cover">
        <source
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6bdd8c01-81a2-4190-9ff8-fdd50e8eae95-y6zHywbsjLf6vmtdFHaKszOW6rWX1v.MP4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
    </div>
  );
}
