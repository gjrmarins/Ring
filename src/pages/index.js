import React, { useState } from "react";


const SmokeQualityApp = () => {
  const [photo, setPhoto] = useState(null);
  const [data, setData] = useState([]);
  const [plate, setPlate] = useState("");
  const [equipmentType, setEquipmentType] = useState("");

  const handlePlateChange = (e) => {
    let value = e.target.value.toUpperCase(); // Converte para maiúsculas
    value = value.replace(/[^A-Z0-9-]/g, ""); // Permite apenas letras, números e '-'
    setPlate(value);
  };

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
    if (!file || !file.type.startsWith("image/")) {
      alert("Por favor, envie um arquivo de imagem válido.");
      return;
    }
    
    const timestamp = Date.now();
    const uniqueFile = new File([file], `${file.name.split(".")[0]}_${timestamp}.${file.name.split(".").pop()}`, { type: file.type });
    
    const tempUrl = URL.createObjectURL(uniqueFile);
    setTimeout(() => {
      setPhoto(tempUrl);
    }, 100);
    
    const evaluatedQuality = await analyzeSmokeQuality(file);
    setData([...data, {
      id: data.length + 1,
      plate,
      equipmentType,
      quality: evaluatedQuality.description,
      level: evaluatedQuality.level,
      photo: tempUrl 
    }]);
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light p-4">
      <div className="text-center mb-4">
        <img src="/logo.png" alt="Logo" width="150" height="150" />
      </div>
      <div className="card shadow-lg p-4 w-50 text-center">
        <h2 style={{ color: "#4D9354" }} className="mb-4">Adicionar registro</h2>
        <input
          type="text"
          placeholder="Placa"
          value={plate}
          onChange={handlePlateChange}
          className="form-control mb-3"
        />
        <select
          className="form-control mb-3"
          value={equipmentType}
          onChange={(e) => setEquipmentType(e.target.value)}
        >
          <option value="">Selecione o tipo do equipamento</option>
          <option value="veiculo">Veículo</option>
          <option value="estacionaria">Estacionária</option>
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="form-control mb-3"
        />
        {photo && (
          <div className="text-center mb-3">
            <img src={photo} alt="Preview" className="img-fluid rounded" style={{ maxHeight: "300px" }} />
          </div>
        )}
      </div>      
      <div className="card shadow-lg p-4 mt-4 w-50">
        <h2 className="text-secondary text-center mb-4">Histórico</h2>
        <ul className="list-group">
          {data.map((entry) => (
            <li key={entry.id} className="list-group-item d-flex flex-column align-items-center">
              <p className="fw-bold text-dark">Placa: </p> {entry.plate}
              <p className="fw-bold text-dark">Tipo de Equipamento: {entry.equipmentType}</p>
              <p className="fw-bold text-dark">Nível {entry.level}: {entry.quality}</p>
              <img src={entry.photo} alt="Registro" className="img-thumbnail" style={{ maxHeight: "200px" }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SmokeQualityApp;