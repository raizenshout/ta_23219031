"""
This is the people module and supports all the REST actions for the
people data
"""

from flask import make_response, abort
from config import db
from models.models import Resep, Bahan, ResepSchema


def read_all():
    """
    This function responds to a request for /api/resep
    with the complete lists of resep
    :return:        json string of list of resep
    """
    # Create the list of resep from our data
    resep = Resep.query.order_by(Resep.nama_resep).all()

    # Serialize the data for the response
    resep_schema = ResepSchema(many=True)
    data = resep_schema.dump(resep)
    return data


def read_one(resep_id):
    """
    This function responds to a request for /api/resep/{resep_id}
    with one matching resep from resep
    :param resep_id:   Id of resep to find
    :return:            resep matching id
    """
    # Build the initial query
    resep = (
        Resep.query.filter(Resep.resep_id == resep_id)
        .outerjoin(Bahan)
        .one_or_none()
    )

    # Did we find a resep?
    if resep is not None:

        # Serialize the data for the response
        resep_schema = ResepSchema()
        data = resep_schema.dump(resep)
        return data

    # Otherwise, nope, didn't find that resep
    else:
        abort(404, f"Resep tidak ditemukan pada Id: {resep_id}")


def create(resep):
    """
    This function creates a new resep in the resep structure
    based on the passed in resep data
    :param resep:  resep to create in resep structure
    :return:        201 on success, 406 on resep exists
    """
    nama_resep = resep.get("nama_resep")
    penulis = resep.get("penulis")
    tags = resep.get("tags")

    existing_resep = (
        Resep.query.filter(Resep.nama_resep == nama_resep)
        .filter(Resep.penulis == penulis)
        .filter(Resep.tags == tags)
        .one_or_none()
    )

    # Can we insert this resep?
    if existing_resep is None:

        # Create a person instance using the schema and the passed in person
        schema = ResepSchema()
        new_resep = schema.load(resep, session=db.session)

        # Add the person to the database
        db.session.add(new_resep)
        db.session.commit()

        # Serialize and return the newly created person in the response
        data = schema.dump(new_resep)

        return data, 201

    # Otherwise, nope, resep exists already
    else:
        abort(409, f"Resep {nama_resep} yang ditulis oleh {penulis} sudah ada pada kategori {tags}")


def update(resep_id, resep):
    """
    This function updates an existing resep in the resep structure
    :param resep_id:   Id of the resep to update in the resep structure
    :param resep:      resep to update
    :return:            updated person structure
    """
    # Get the resep requested from the db into session
    update_resep = Resep.query.filter(
        Resep.resep_id == resep_id
    ).one_or_none()

    # Did we find an existing resep?
    if update_resep is not None:

        # turn the passed in resep into a db object
        schema = ResepSchema()
        update = schema.load(resep, session=db.session)

        # Set the id to the resep we want to update
        update.resep_id = update_resep.resep_id

        # merge the new object into the old and commit it to the db
        db.session.merge(update)
        db.session.commit()

        # return updated resep in the response
        data = schema.dump(update_resep)

        return data, 200

    # Otherwise, nope, didn't find that resep
    else:
        abort(404, f"Resep not found for Id: {resep_id}")


def delete(resep_id):
    """
    This function deletes a resep from the people structure
    :param resep_id:   Id of the resep to delete
    :return:            200 on successful delete, 404 if not found
    """
    # Get the resep requested
    resep = Resep.query.filter(Resep.resep_id == resep_id).one_or_none()

    # Did we find a resep?
    if resep is not None:
        db.session.delete(resep)
        db.session.commit()
        return make_response(f"Resep {resep_id} telah dihapus", 200)

    # Otherwise, nope, didn't find that resep
    else:
        abort(404, f"Resep tidak ditemukan pada  Id: {resep_id}")