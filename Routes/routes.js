const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// GET all records
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM [dbo].[SGFBL1NOPEN]');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// GET with filtering and pagination including Pstng Date
router.get('/filter', async (req, res) => {
    try {
        const pool = await poolPromise;

        const {
            vendor,
            reference,
            cocd,
            pstngDate,
            page = 1,
            limit = Number.MAX_SAFE_INTEGER
        } = req.query;

        let query = 'SELECT * FROM [dbo].[SGFBL1NOPEN] WHERE 1=1';
        const request = pool.request();

        if (vendor) {
            query += ' AND Vendor = @vendor';
            request.input('vendor', sql.Float, vendor);
        }

        if (reference) {
            query += ' AND Reference = @reference';
            request.input('reference', sql.Float, reference);
        }

        if (cocd) {
            query += ' AND LOWER(CoCd) = LOWER(@cocd)';
            request.input('cocd', sql.NVarChar, cocd);
        }

        if (pstngDate) {
            query += ' AND [Pstng Date] = @pstngDate';
            request.input('pstngDate', sql.NVarChar, pstngDate);
        }

        const offset = (page - 1) * limit;
        query += ` ORDER BY DocumentNo OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// GET by CoCd
router.get('/cocd/:CoCd', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CoCd', sql.NVarChar, req.params.CoCd)
            .query('SELECT * FROM [dbo].[SGFBL1NOPEN] WHERE LOWER(CoCd) = LOWER(@CoCd)');

        if (result.recordset.length === 0) {
            return res.status(404).send('Company code not found');
        }

        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// GET by DocumentNo (numeric only)
router.get('/:DocumentNo', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('DocumentNo', sql.Float, req.params.DocumentNo)
            .query('SELECT * FROM [dbo].[SGFBL1NOPEN] WHERE DocumentNo = @DocumentNo');

        if (result.recordset.length === 0) {
            return res.status(404).send('Document not found');
        }

        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// CREATE a new record

router.post('/', async (req, res) => {
    try {
        const {
            Type, Vendor, DocumentNo, ClrngDoc, Reference, PurDoc,
            CoCd, DocumentHeaderText, DocDate, ProfitCtr, PstngDate,
            NetDueDt, Curr, AmtInLocCur, Clearing, PBk,
            WithTaxBaseAmount, WithholdingTaxAmnt
        } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('Type', sql.NVarChar, Type)
            .input('Vendor', sql.Float, Vendor)
            .input('DocumentNo', sql.Float, DocumentNo)
            .input('ClrngDoc', sql.NVarChar, ClrngDoc)
            .input('Reference', sql.Float, Reference)
            .input('PurDoc', sql.NVarChar, PurDoc)
            .input('CoCd', sql.NVarChar, CoCd)
            .input('DocumentHeaderText', sql.NVarChar, DocumentHeaderText)
            .input('DocDate', sql.NVarChar, DocDate)
            .input('ProfitCtr', sql.NVarChar, ProfitCtr)
            .input('PstngDate', sql.NVarChar, PstngDate)
            .input('NetDueDt', sql.NVarChar, NetDueDt)
            .input('Curr', sql.NVarChar, Curr)
            .input('AmtInLocCur', sql.NVarChar, AmtInLocCur)
            .input('Clearing', sql.NVarChar, Clearing)
            .input('PBk', sql.NVarChar, PBk)
            .input('WithTaxBaseAmount', sql.NVarChar, WithTaxBaseAmount)
            .input('WithholdingTaxAmnt', sql.NVarChar, WithholdingTaxAmnt)
            .query(`
                INSERT INTO [dbo].[SGFBL1NOPEN] (
                    [Type], [Vendor], [DocumentNo], [Clrng doc#], [Reference], [Pur# Doc#],
                    [CoCd], [Document Header Text], [Doc# Date], [Profit Ctr], [Pstng Date],
                    [Net due dt], [Curr#], [ Amt in loc#cur#], [Clearing], [PBk],
                    [With#tax base amount], [Withholding tax amnt]
                ) VALUES (
                    @Type, @Vendor, @DocumentNo, @ClrngDoc, @Reference, @PurDoc,
                    @CoCd, @DocumentHeaderText, @DocDate, @ProfitCtr, @PstngDate,
                    @NetDueDt, @Curr, @AmtInLocCur, @Clearing, @PBk,
                    @WithTaxBaseAmount, @WithholdingTaxAmnt
                )
            `);
        res.status(201).send('Record inserted successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// UPDATE by DocumentNo
router.put('/:DocumentNo', async (req, res) => {
    try {
        const {
            Type, Vendor, ClrngDoc, Reference, PurDoc,
            CoCd, DocumentHeaderText, DocDate, ProfitCtr, PstngDate,
            NetDueDt, Curr, AmtInLocCur, Clearing, PBk,
            WithTaxBaseAmount, WithholdingTaxAmnt
        } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('DocumentNo', sql.Float, req.params.DocumentNo)
            .input('Type', sql.NVarChar, Type)
            .input('Vendor', sql.Float, Vendor)
            .input('ClrngDoc', sql.NVarChar, ClrngDoc)
            .input('Reference', sql.Float, Reference)
            .input('PurDoc', sql.NVarChar, PurDoc)
            .input('CoCd', sql.NVarChar, CoCd)
            .input('DocumentHeaderText', sql.NVarChar, DocumentHeaderText)
            .input('DocDate', sql.NVarChar, DocDate)
            .input('ProfitCtr', sql.NVarChar, ProfitCtr)
            .input('PstngDate', sql.NVarChar, PstngDate)
            .input('NetDueDt', sql.NVarChar, NetDueDt)
            .input('Curr', sql.NVarChar, Curr)
            .input('AmtInLocCur', sql.NVarChar, AmtInLocCur)
            .input('Clearing', sql.NVarChar, Clearing)
            .input('PBk', sql.NVarChar, PBk)
            .input('WithTaxBaseAmount', sql.NVarChar, WithTaxBaseAmount)
            .input('WithholdingTaxAmnt', sql.NVarChar, WithholdingTaxAmnt)
            .query(`
                UPDATE [dbo].[SGFBL1NOPEN]
                SET [Type] = @Type, [Vendor] = @Vendor, [Clrng doc#] = @ClrngDoc,
                    [Reference] = @Reference, [Pur# Doc#] = @PurDoc, [CoCd] = @CoCd,
                    [Document Header Text] = @DocumentHeaderText, [Doc# Date] = @DocDate,
                    [Profit Ctr] = @ProfitCtr, [Pstng Date] = @PstngDate, [Net due dt] = @NetDueDt,
                    [Curr#] = @Curr, [ Amt in loc#cur#] = @AmtInLocCur, [Clearing] = @Clearing,
                    [PBk] = @PBk, [With#tax base amount] = @WithTaxBaseAmount,
                    [Withholding tax amnt] = @WithholdingTaxAmnt
                WHERE [DocumentNo] = @DocumentNo
            `);
        res.send('Record updated successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// DELETE by DocumentNo
router.delete('/:DocumentNo', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('DocumentNo', sql.Float, req.params.DocumentNo)
            .query('DELETE FROM [dbo].[SGFBL1NOPEN] WHERE DocumentNo = @DocumentNo');
        res.send('Record deleted successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});


module.exports = router;
