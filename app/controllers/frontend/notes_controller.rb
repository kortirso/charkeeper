# frozen_string_literal: true

module Frontend
  class NotesController < Frontend::BaseController
    include Deps[
      add_note: 'commands.notes_context.add',
      change_note: 'commands.notes_context.change'
    ]
    include SerializeResource
    include SerializeRelation

    before_action :find_note, only: %i[update destroy]

    def index
      serialize_relation(noteable.notes.order(created_at: :desc), ::NoteSerializer, :notes)
    end

    def create
      case add_note.call(note_params.merge({ noteable: noteable }))
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result } then serialize_resource(result, ::NoteSerializer, :note, {}, :created)
      end
    end

    def update
      case change_note.call(note_params.merge({ note: @note }))
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result } then serialize_resource(result, ::NoteSerializer, :note, {}, :ok)
      end
    end

    def destroy
      @note.destroy
      only_head_response
    end

    private

    def find_note
      @note = noteable.notes.find(params[:id])
    end

    def note_params
      params.require(:note).permit!.to_h
    end
  end
end
