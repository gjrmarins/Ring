import React, { useState } from "react";

const SmokeQualityApp = () => {
  const [photo, setPhoto] = useState(null);
  const [data, setData] = useState([]);

  const analyzeSmokeQuality = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function () {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const pixels = imageData.data;
          let totalLuminance = 0;
          let pixelCount = pixels.length / 4;

          for (let i = 0; i < pixels.length; i += 4) {
            let r = pixels[i];
            let g = pixels[i + 1];
            let b = pixels[i + 2];
            let luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            totalLuminance += luminance;
          }

          let avgLuminance = totalLuminance / pixelCount;
          let opacityLevel = 100 - (avgLuminance / 255) * 100;

          const ringelmannLevels = [
            { level: 0, description: "Branco", minOpacity: 0, maxOpacity: 19 },
            { level: 1, description: "Cinza Claro", minOpacity: 20, maxOpacity: 39 },
            { level: 2, description: "Cinza Médio", minOpacity: 40, maxOpacity: 59 },
            { level: 3, description: "Cinza Escuro", minOpacity: 60, maxOpacity: 79 },
            { level: 4, description: "Preto", minOpacity: 80, maxOpacity: 100 },
          ];

          let evaluatedLevel = ringelmannLevels.find(
            (level) => opacityLevel >= level.minOpacity && opacityLevel <= level.maxOpacity
          );

          resolve(evaluatedLevel || ringelmannLevels[0]);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPhoto(imageUrl);
      const evaluatedQuality = await analyzeSmokeQuality(file);
      setData([...data, { id: data.length + 1, quality: evaluatedQuality.description, level: evaluatedQuality.level, photo: imageUrl }]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Análise de Fumaça - Escala de Ringelmann</h1>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="block w-full text-gray-700 py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300 mb-4"
        />
        {photo && (
          <div className="flex justify-center mb-4">
            <img src={photo} alt="Preview" className="w-64 h-auto rounded-md shadow-md" />
          </div>
        )}
      </div>
      <div className="mt-6 w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Registros</h2>
        <ul className="space-y-4">
          {data.map((entry) => (
            <li key={entry.id} className="border p-4 rounded-lg shadow-md bg-gray-50">
              <p className="text-lg font-semibold text-gray-700">Nível {entry.level}: {entry.quality}</p>
              <div className="flex justify-center mt-2">
                <img src={entry.photo} alt="Registro" className="w-64 h-auto rounded-md shadow-sm" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SmokeQualityApp;
