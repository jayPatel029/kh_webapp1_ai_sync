import React, { useState, useEffect, useRef } from "react";
import AilmentList from "./AilmentList";
import { getLanguages } from "../../../ApiCalls/languageApis";
import {
  getAilments,
  addAilment,
  updateAilment,
} from "../../../ApiCalls/ailmentApis";
import { uploadFile } from "../../../ApiCalls/dataUpload";
import FileUploadWithCamera from "../../../components/FileUploadWithCamera";
// Design system primitives
import {
  Container,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Button,
  Heading,
  Text,
  Box,
} from "../../../component-library";

export default function AilmentMasterComponent() {
  // State to hold the selected ailment data

  const [translations, setTranslations] = useState({});
  const [name, setName] = useState("");
  const [ailments, setAilments] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [Ailment_Img, setAilment_Img] = useState(null);
  const [errmsg, setErrmsg] = useState("");
  const [successmsg, setSuccessmsg] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [id, setId] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        getAilments().then((resultAilment) => {
          if (resultAilment.success && resultAilment.data.listOfAilments) {
            setAilments(resultAilment.data.listOfAilments);
          } else {
            console.error("Failed to fetch Ailments:", resultAilment);
          }
        });

        getLanguages().then((resultLanguage) => {
          if (resultLanguage.success && resultLanguage.data) {
            setLanguages(resultLanguage.data);
            let transaltiondict = {};
            resultLanguage.data.forEach((lang) => {
              if (lang.id !== 1) {
                transaltiondict[lang.id] = "";
              }
            });
            setTranslations(transaltiondict);
          } else {
            console.error("Failed to fetch Languages:", resultLanguage);
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [successmsg]);

  const getFileRes = async (file) => {
    try {
      if (file) {
        let formData = new FormData();
        formData.append("file", file, file?.name);
        const fileRes = await uploadFile(formData);
        return fileRes;
      } else {
        return { data: { objectUrl: "" } };
      }
    } catch (error) {
      setErrmsg("Error uploading file:");
      console.error(error);
    }
  };

  const clearFields = () => {
    setName("");
    let transaltiondict = {};
    languages.forEach((lang) => {
      if (lang.id !== 1) {
        transaltiondict[lang.id] = "";
      }
    });
    setEditMode(false);
    setTranslations(transaltiondict);
    setSuccessmsg("");
    setErrmsg("");
  };

  const submitAilment = async () => {
    const Ailment_Img_Url = await getFileRes(Ailment_Img);
    const ailmentData = {
      id: id,
      name: name,
      translations: translations,
      Ailment_Img: Ailment_Img_Url?.data?.objectUrl,
    };
    try {
      if (!editMode) {
        addAilment(ailmentData).then((result) => {
          if (result.success) {
            clearFields();
            setSuccessmsg("Ailment added successfully");
          } else {
            setErrmsg("Failed to add Ailment");
          }
        });
      } else {
        updateAilment(id, ailmentData).then((result) => {
          if (result.success) {
            clearFields();
            setSuccessmsg("Ailment updated successfully");
          } else {
            setErrmsg("Failed to update Ailment");
          }
        });
      }
    } catch (error) {
      console.error("Error adding Ailment:", error);
    }
  };

  // Focus form when edit mode enabled
  useEffect(() => {
    if (editMode && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [editMode]);

  return (
    <Container size="lg" className="py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Form */}
        <Card className="md:col-span-2" variant="elevated" ref={formRef} id="ailment-form">
          <CardHeader>
            <Heading size="md">Ailment Master</Heading>
            <Text className="text-sm text-muted">Add or edit ailments and icons</Text>
          </CardHeader>

          <CardBody>
            <Box className="space-y-4">
              <FormControl>
                <FormLabel>English Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter ailment name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>

              {languages.map((language, index) => {
                if (language.id === 1) return null;
                return (
                  <FormControl key={language.id}>
                    <FormLabel>{language.language_name}</FormLabel>
                    <Input
                      type="text"
                      placeholder={`Enter name in ${language.language_name}`}
                      value={translations[language.id] || ""}
                      onChange={(e) => {
                        setTranslations({
                          ...translations,
                          [language.id]: e.target.value,
                        });
                      }}
                    />
                  </FormControl>
                );
              })}

              <FormControl>
                <FormLabel>Icon</FormLabel>
                <FileUploadWithCamera
                  onFileChange={(file) => setAilment_Img(file)}
                  accept="image/*"
                  attachLabel="Upload Icon"
                  captureLabel="Capture Icon"
    //               images?: never[] | undefined;
    // onChange?: (() => void) | undefined;
    //             accept?: string | undefined;
    //             multiple?: boolean | undefined;
    //             append?: boolean | undefined;
    //             attachLabel?: string | undefined;
    //             captureLabel?: string | undefined;
    //             previewWidth?: number | undefined;
    //             previewHeight?: number | undefined;
    //             showCountInfo?: boolean | undefined;
                  previewWidth={100}
                  previewHeight={100}
                  showCountInfo={false}
                />
              </FormControl>

              {errmsg && <FormErrorMessage className="mt-2">{errmsg}</FormErrorMessage>}
              {successmsg && <Text className="text-success mt-2">{successmsg}</Text>}
            </Box>
          </CardBody>

          <CardFooter>
            {!editMode ? (
              <Button variant="primary" onClick={submitAilment}>
                Submit
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="primary" onClick={submitAilment}>
                  Update
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditMode(false);
                    clearFields();
                  }}>
                  Cancel
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* List */}
        <Card className="md:col-span-2" variant="elevated">
          <CardHeader>
            <div className="flex items-center w-full">
              <Heading size="md">Ailment List</Heading>
              <div className="ml-auto text-sm text-muted">{ailments.length} records</div>
            </div>
          </CardHeader>

          <CardBody>
            <AilmentList
              setName={setName}
              setTranslations={setTranslations}
              ailments={ailments}
              setEditMode={setEditMode}
              setId={setId}
              setSuccessful={setSuccessmsg}
            />
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}
