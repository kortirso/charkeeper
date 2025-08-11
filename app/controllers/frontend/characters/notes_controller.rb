# frozen_string_literal: true

module Frontend
  module Characters
    class NotesController < Frontend::BaseController
      include Deps[
        add_note: 'commands.characters_context.add_note',
        change_note: 'commands.characters_context.change_note'
      ]
      include SerializeResource
      include SerializeRelation

      INDEX_SERIALIZER_FIELDS = %i[id title value].freeze
      CREATE_SERIALIZE_FIELDS = %i[id title value].freeze

      before_action :find_note, only: %i[update destroy]

      def index
        serialize_relation(
          character.notes.order(created_at: :desc),
          ::Characters::NoteSerializer,
          :notes,
          only: INDEX_SERIALIZER_FIELDS
        )
      end

      def create
        case add_note.call(note_params.merge({ character: character }))
        in { errors: errors } then unprocessable_response(errors)
        in { result: result }
          serialize_resource(result, ::Characters::NoteSerializer, :note, { only: CREATE_SERIALIZE_FIELDS }, :created)
        end
      end

      def update
        case change_note.call(note_params.merge({ note: @note }))
        in { errors: errors } then unprocessable_response(errors)
        else only_head_response
        end
      end

      def destroy
        @note.destroy
        only_head_response
      end

      private

      def find_note
        @note = character.notes.find(params[:id])
      end

      def character
        authorized_scope(Character.all).find(params[:character_id])
      end

      def note_params
        params.require(:note).permit!.to_h
      end
    end
  end
end
