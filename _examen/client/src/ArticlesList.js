import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { FilterMatchMode } from 'primereact/api'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import "primereact/resources/themes/bootstrap4-dark-blue/theme.css";

import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Calendar } from 'primereact/calendar';


import {SERVER} from './config/global'

function ArticlesList(props) {
    const navigate = useNavigate()

    const [isDialogShown, setIsDialogShown] = useState(false)
    const [articles, setArticles] = useState([])
    const [title, setTitle] = useState('')
    const [summary, setSummary] = useState('')
    const [date, setDate] = useState('')
    const [isNewRecord, setIsNewRecord] = useState(true)
    const [count, setCount] = useState(0)
    const [sortField, setSortField] = useState('')
    const [sortOrder, setSortOrder] = useState(1)
    const [selectedArticle, setSelectedArticle] = useState(null)
    const [filterString, setFilterString] = useState('')
    const [filters, setFilters] = useState({
        title: { value: null, matchMode: FilterMatchMode.CONTAINS },
        summary: { value: null, matchMode: FilterMatchMode.CONTAINS }

    })


    const [page, setPage] = useState(0)
    const [first, setFirst] = useState(0)

    const getArticles = async (filterString, page, pageSize, sortField, sortOrder) => {
        const response = await fetch(`${SERVER}/articles?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
        const data = await response.json()
        setArticles(data.records)
        setCount(data.count)
    }

    const addArticle = async (article) => {
        await fetch(`${SERVER}/articles`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(article)
        })
        getArticles(filterString, page, 2, sortField, sortOrder)
    }

    const editArticle = async (article) => {
        console.log(article);
        await fetch(`${SERVER}/articles/${article.selectedArticle}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(article)
        })
        getArticles(filterString, page, 2, sortField, sortOrder)
    }

    const deleteArticle = async (article) => {
        await fetch(`${SERVER}/articles/${article}`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        getArticles(filterString, page, 2, sortField, sortOrder)
    }

    useEffect(() => {
        getArticles(filterString, page, 2, sortField, sortOrder)
    }, [filterString, page, sortField, sortOrder])

    const handleFilter = (evt) => {
        const oldFilters = filters
        oldFilters[evt.field] = evt.constraints.constraints[0]
        console.log(oldFilters);
        setFilters({ ...oldFilters })
    }

    useEffect(() => {
        const keys = Object.keys(filters)
        const computedFilterString = keys.map(e => {
            return {
                key: e,
                value: filters[e].value
            }
        }).filter(e => e.value).map(e => `${e.key}=${e.value}`).join('&')
        setFilterString(computedFilterString)
    }, [filters])

    const handleFilterClear = (evt) => {
        setFilters({
            title: { value: null, matchMode: FilterMatchMode.CONTAINS },
            summary: { value: null, matchMode: FilterMatchMode.CONTAINS }
        })
    }

    const handleAddClick = (ev) => {


        setIsDialogShown(true)
        setIsNewRecord(true)
        setTitle('')
        setSummary('')
        setDate('')
    }

    const handleSaveClick = () => {
        if(isNewRecord){
            addArticle({title, summary, date})
        }else{
            editArticle({selectedArticle,title, summary, date})
        }
        setIsDialogShown(false)
        setSelectedArticle(null)
        setTitle('')
        setSummary('')
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

    const handleEditArticle = (rowData) => {
        setSelectedArticle(rowData.articleID)
        setTitle(rowData.title)
        setSummary(rowData.summary)
        setDate(rowData.date)
        
        setIsDialogShown(true)
        setIsNewRecord(false)
      }

    const handleDelete = (rowData) => {
        setSelectedArticle(rowData.articleID)
        deleteArticle(rowData.articleID)
    }  


    const opsColumn = (rowData) => {
        return (
            <>
                <Button label='Edit' icon='pi pi-pencil' onClick={()=>handleEditArticle(rowData)}/>
                <Button label='Delete' icon='pi pi-times' className='p-button p-button-danger' onClick={()=>handleDelete(rowData)} />
                <Button label='References' className='p-button p-button-success' onClick={() => navigate(`/${rowData.articleID}/references`)} />

            </>
        )
    }

    const handlePageChange = (evt) => {
        setPage(evt.page)
        setFirst(evt.page * 2)
    }

    const handleSort = (evt) => {
        console.warn(evt)
        setSortField(evt.sortField)
        setSortOrder(evt.sortOrder)
    }

    const hideDialog = () => {
        setIsDialogShown(false)
    }

    return (
        <div>

            <DataTable
                value={articles}
                footer={tableFooter}
                lazy
                paginator
                onPage={handlePageChange}
                first={first}
                rows={2}
                totalRecords={count}
                onSort={handleSort}
                sortField={sortField}
                sortOrder={sortOrder}
            >
                <Column header='Title' field='title' filter filterField='title' filterPlaceholder='filter by title' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
                <Column header='Summary' field='summary' filter filterField='summary' filterPlaceholder='filter by summary' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
                <Column header='Date' field='date' />
                <Column body={opsColumn} />
            </DataTable>
            <Dialog header='An article' visible={isDialogShown} onHide={hideDialog} footer={dialogFooter}>
                <div>
                    <InputText placeholder='title' onChange={(evt) => setTitle(evt.target.value)} value={title} />
                </div>
                <div>
                    <InputText placeholder='summary' onChange={(evt) => setSummary(evt.target.value)} value={summary} />
                </div>
                <div>
                    <InputText placeholder='date' onChange={(evt) => setDate(evt.target.value)} value={date} />
                </div>
                <br></br>
                <Calendar dateFormat="yy-mm-dd" inline value={date} onChange={(e) => setDate(e.value)}></Calendar>
            </Dialog>

        </div>

    );
}

export default ArticlesList;
