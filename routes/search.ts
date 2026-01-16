/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { QueryTypes } from 'sequelize'

import * as utils from '../lib/utils'
import * as models from '../models/index'
import { UserModel } from '../models/user'
import { challenges } from '../data/datacache'
import * as challengeUtils from '../lib/challengeUtils'

class ErrorWithParent extends Error {
  parent: Error | undefined
}

// vuln-code-snippet start unionSqlInjectionChallenge dbSchemaChallenge
export function searchProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Préparation sécurisée des critères
    let criteria: string = req.query.q === 'undefined' ? '' : (req.query.q as string ?? '')
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)

    // 2. Requête SQL sécurisée
    models.sequelize.query(
      `SELECT * FROM Products WHERE ((name LIKE :search OR description LIKE :search) AND deletedAt IS NULL) ORDER BY name`,
      {
        replacements: { search: `%${criteria}%` },
        type: QueryTypes.SELECT // Renvoie un tableau d'objets propre
      }
    )
    .then((products: any) => {
      // 3. Traduction (On traite directement le tableau 'products')
      for (let i = 0; i < products.length; i++) {
        products[i].name = req.__(products[i].name)
        products[i].description = req.__(products[i].description)
      }

      // 4. Réponse JSON : Ne contient QUE les produits
      res.json(utils.queryResultToJson(products))
    })
    .catch((error: ErrorWithParent) => {
      next(error.parent || error)
    })
  }
}
// vuln-code-snippet end unionSqlInjectionChallenge dbSchemaChallenge
