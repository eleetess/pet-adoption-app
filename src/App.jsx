import { useState, useEffect } from "react";
import "./App.scss";
import {
  createItem,
  listAllItems,
  updateItem,
  deleteItem,
} from "./utils/dynamo";
import { Box, Button, Typography, Modal } from "@mui/material";

function App() {
  const [pets, setPets] = useState([]);
  const [open, setOpen] = useState(false);
  const [petToUpdate, setPetToUpdate] = useState(null);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "hsla(209, 88%, 20%, 1.00)",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    (async () => {
      setPets(await listAllItems("Pet"));
    })();
  }, []);

  const handleAddPet = async (e) => {
    e.preventDefault();
    const newPet = {
      id: Date.now().toString(),
      name: e.target.petName.value,
      age: Number(e.target.age.value),
      isAdopted: e.target.isAdopted.checked,
      species: e.target.species.value,
    };
    await createItem("Pet", newPet);
    setPets((prev) => [...prev, newPet]);
    e.target.reset();
  };

  const handleUpdatePet = async (e) => {
    e.preventDefault();
    await updateItem(
      "Pet",
      { id: petToUpdate.id, name: petToUpdate.name },
      petToUpdate
    );
    setPets((prev) =>
      prev.map((p) => (p.id === petToUpdate.id ? petToUpdate : p))
    );
    setOpen(false);
  };

  const handleDeletePet = async (id, name) => {
    await deleteItem("Pet", { id, name });
    setPets((prev) => prev.filter((p) => p.id !== id));
  };
  const [preview, setPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <header>
        <h1> Pet Adoptions</h1>
      </header>

      <main>
        <form onSubmit={handleAddPet}>
          <h2>Pet Intake Form</h2>
          <label>Photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <img src={preview} alt="pet preview" width={150} />
          <label>Name</label>
          <input type="text" name="petName" required />
          <br />
          <label>Species</label>
          <input type="text" name="species" optional />
          <br />
          <label>Age</label>
          <input type="number" name="age" required />
          <br />
          <label>
            Adopted <input type="checkbox" name="isAdopted" />
          </label>
          <br />
          <button type="submit">Add Pet</button>
        </form>

        <section>
          <h2>Pet Inventory</h2>
          {pets.length === 0 ? (
            <p>No pets available </p>
          ) : (
            pets.map((pet) => (
              <div className="pet-div" key={pet.id}>
                {pet.photoUrl && (
                  <img src={pet.photoUrl} alt={pet.name} width={100} />
                )}
                <p>{pet.name}</p>
                <p>{pet.age}</p>
                <p>{pet.isAdopted ? "Adopted" : "Needs a Home"}</p>
                <p>{pet.species}</p>

                <Button
                  onClick={() => {
                    setPetToUpdate(pet);
                    setOpen(true);
                  }}
                >
                  Update
                </Button>
                <Button
                  color="error"
                  onClick={() => handleDeletePet(pet.id, pet.name)}
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </section>

        <Modal open={open} onClose={() => setOpen(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h4">Update Pet</Typography>
            {petToUpdate && (
              <form onSubmit={handleUpdatePet}>
                <label>Name</label>
                <input type="text" value={petToUpdate.name} disabled />
                <br />
                <label>Age</label>
                <input
                  type="number"
                  value={petToUpdate.age}
                  onChange={(e) =>
                    setPetToUpdate({ ...petToUpdate, age: e.target.value })
                  }
                />
                <br />
                <label>Species</label>
                <br />
                <input type="text" value={petToUpdate.species} />
                <label>
                  Adopted
                  <input
                    type="checkbox"
                    checked={petToUpdate.isAdopted}
                    onChange={(e) =>
                      setPetToUpdate({
                        ...petToUpdate,
                        isAdopted: e.target.checked,
                      })
                    }
                  />
                </label>
                <br />
                <button type="submit">Update Pet</button>
              </form>
            )}
          </Box>
        </Modal>
      </main>
    </>
  );
}

export default App;
