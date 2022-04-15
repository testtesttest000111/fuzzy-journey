import {useParams} from 'react-router-dom'
import React, {useState, useEffect} from 'react';
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import "primereact/resources/themes/bootstrap4-dark-blue/theme.css";

import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import {SERVER} from './config/global'

function ReferencesList(props) {
    
    // articleID
    const {id} = useParams()
    
    const [isDialogShown, setIsDialogShown] = useState(false)
    const [references, setReferences] = useState([])
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [listOfAuthors, setlistOfAuthors] = useState('')
    const [selectedReference, setSelectedReference] = useState(null)
    const [isNewRecord, setIsNewRecord] = useState(true)

    const getReferences = async () => {
        const response = await fetch(`${SERVER}/articles/${id}/references`)
        const data = await response.json()
        setReferences(data)
    }

    const addReference = async (reference) => {
        await fetch(`${SERVER}/articles/${id}/references`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reference)
        })
        getReferences()

    }

    const editReference = async (reference) => {
        await fetch(`${SERVER}/articles/${id}/references/${reference.selectedReference}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reference)
        })
        getReferences()
    }

    const deleteReference = async (ref) => {
        await fetch(`${SERVER}/articles/${id}/references/${ref}`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        getReferences()
    }

    useEffect(() => {
        getReferences()
    })

    const handleAddClick = (ev) => {
        setIsDialogShown(true)
        setIsNewRecord(true)
        setTitle('')
        setlistOfAuthors('')
        setDate('')
    }

    const handleSaveClick = () => {
        if(isNewRecord){
            addReference({title, date, listOfAuthors})
        }else{
            editReference({selectedReference,title, date, listOfAuthors})
        }
        setIsDialogShown(false)
        setSelectedReference(null)
        setTitle('')
        setlistOfAuthors('')
        setDate('')
    }

    const tableFooter = (
        <div>
            <Button label='Add' icon='pi pi-plus' onClick={handleAddClick} />
        </div>
    )

    const dialogFooter = (
        <div>
            <Button label='Save' icon='pi pi-save' onClick={handleSaveClick} />
        </div>
    )

    const handleEditReference = (rowData) => {
        setSelectedReference(rowData.refID)
        setTitle(rowData.title)
        setlistOfAuthors(rowData.listOfAuthors)
        setDate(rowData.date)
        
        setIsDialogShown(true)
        setIsNewRecord(false)
      }

    const handleDelete = (rowData) => {
        console.log(rowData.refID);
        
        setSelectedReference(rowData.refID)
        deleteReference(rowData.refID)
    }  


    const opsColumn = (rowData) => {
        return (
            <>
                <Button label='Edit' icon='pi pi-pencil' onClick={()=>handleEditReference(rowData)}/>
                <Button label='Delete' icon='pi pi-times' className='p-button p-button-danger' onClick={()=>handleDelete(rowData)} />

            </>
        )
    }

    const hideDialog = () => {
        setIsDialogShown(false)
    }

    return (
      <div>
          <DataTable
                value={references}
                footer={tableFooter}
                lazy
                rows={2}
            >
                <Column header='Title' field='title' />
                <Column header='List of authors' field='listOfAuthors' />
                <Column header='Date' field='date' />
                <Column body={opsColumn} />
            </DataTable>
            <Dialog header='A reference' visible={isDialogShown} onHide={hideDialog} footer={dialogFooter}>
                <div>
                    <InputText placeholder='title' onChange={(evt) => setTitle(evt.target.value)} value={title} />
                </div>
                <div>
                    <InputText placeholder='list of authors' onChange={(evt) => setlistOfAuthors(evt.target.value)} value={listOfAuthors} />
                </div>
                <div>
                    <InputText placeholder='date' onChange={(evt) => setDate(evt.target.value)} value={date} />
                </div>
            </Dialog>
      </div>
  
      );
  }
  
  export default ReferencesList;
  