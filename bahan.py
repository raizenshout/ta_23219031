"""
This is the people module and supports all the REST actions for the
people data
"""

from flask import make_response, abort
from marshmallow import INCLUDE

from config import db
from models.models import Resep, Bahan, BahanSchema


def read_all():
    """
    This function responds to a request for /api/resep/bahan
    with the complete list of bahan, sorted by bahan timestamp
    :return:                json list of all bahan for all people
    """
    # Query the database for all the bahan
    bahan = Bahan.query.order_by(db.desc(Bahan.timestamp)).all()

    # Serialize the list of bahan from our data
    bahan_schema = BahanSchema(many=True)
    data = bahan_schema.dump(bahan)
    return data


def read_one(resep_id, bahan_id):
    """
    This function responds to a request for
    /api/resep/{resep_id}/bahan/{bahan_id}
    with one matching bahan for the associated resep
    :param resep_id:       Id of resep the bahan is related to
    :param bahan_id:         Id of the bahan
    :return:                json string of bahan contents
    """
    # Query the database for the bahan
    bahan = (
        Bahan.query.join(Resep, Resep.resep_id == Bahan.resep_id)
        .filter(Resep.resep_id == resep_id)
        .filter(Bahan.bahan_id == bahan_id)
        .one_or_none()
    )

    # Was a bahan found?
    if bahan is not None:
        bahan_schema = BahanSchema()
        data = bahan_schema.dump(bahan)
        return data

    # Otherwise, nope, didn't find that bahan
    else:
        abort(404, f"Bahan tidak ditemukan pada Id: {bahan_id}")


def create(resep_id, bahan):
    """
    This function creates a new note related to the passed in resep id.
    :param resep_id:       Id of the resep the bahan is related to
    :param bahan:            The JSON containing the bahan data
    :return:                201 on success
    """
    # get the parent resep
    resep = Resep.query.filter(Resep.resep_id == resep_id).one_or_none()

    # Was a resep found?
    if resep is None:
        abort(404, f"Resep tidak ditemukan pada Id: {resep_id}")

    # Create a note schema instance
    schema = BahanSchema()
    new_bahan = schema.load(bahan, session=db.session)

    # Add the note to the resep and database
    resep.bahan.append(new_bahan)
    db.session.commit()

    # Serialize and return the newly created note in the response
    data = schema.dump(new_bahan)

    return data, 201


def update(resep_id, bahan_id, bahan):
    """
    This function updates an existing bahan related to the passed in
    person id.
    :param resep_id:       Id of the resep the bahan is related to
    :param bahan_id:         Id of the bahan to update
    :param content:            The JSON containing the bahan data
    :return:                200 on success
    """
    update_bahan = (
        Bahan.query.filter(Resep.resep_id == resep_id)
        .filter(Bahan.bahan_id == bahan_id)
        .one_or_none()
    )

    # Did we find an existing bahan?
    if update_bahan is not None:

        # turn the passed in bahan into a db object
        schema = BahanSchema()
        update = schema.load(bahan, session=db.session, unknown=INCLUDE)

        # Set the id's to the bahan we want to update
        update.resep_id = update_bahan.resep_id
        update.bahan_id = update_bahan.bahan_id

        # merge the new object into the old and commit it to the db
        db.session.merge(update)
        db.session.commit()

        # return updated note in the response
        data = schema.dump(update_bahan)

        return data, 200

    # Otherwise, nope, didn't find that bahan
    else:
        abort(404, f"Bahan tidak ditemukan pada Id: {bahan_id}")


def delete(resep_id, bahan_id):
    """
    This function deletes a bahan from the bahan structure
    :param resep_id:   Id of the resep the bahan is related to
    :param bahan_id:     Id of the bahan to delete
    :return:            200 on successful delete, 404 if not found
    """
    # Get the bahan requested
    bahan = (
        Bahan.query.filter(Resep.resep_id == resep_id)
        .filter(Bahan.bahan_id == bahan_id)
        .one_or_none()
    )

    # did we find a bahan?
    if bahan is not None:
        db.session.delete(bahan)
        db.session.commit()
        return make_response(
            "Bahan {bahan_id} deleted".format(bahan_id=bahan_id), 200
        )

    # Otherwise, nope, didn't find that bahan
    else:
        abort(404, f"Bahan tidak ditemukan pada Id: {bahan_id}")