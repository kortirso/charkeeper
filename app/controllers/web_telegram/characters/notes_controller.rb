# frozen_string_literal: true

module WebTelegram
  module Characters
    class NotesController < WebTelegram::BaseController
      include Deps[add_note: 'commands.characters_context.add_note']
      include SerializeResource
      include SerializeRelation

      INDEX_SERIALIZER_FIELDS = %i[id title value].freeze
      CREATE_SERIALIZE_FIELDS = %i[id title value].freeze

      before_action :find_note, only: %i[destroy]

      def index
        render json: serialize_relation(
          character.notes.order(created_at: :desc),
          ::Characters::NoteSerializer,
          :notes,
          only: INDEX_SERIALIZER_FIELDS
        ), status: :ok
      end

      def create
        case add_note.call(create_params.merge({ character: character }))
        in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
        in { result: result }
          serialize_resource(result, ::Characters::NoteSerializer, :note, { only: CREATE_SERIALIZE_FIELDS }, :created)
        end
      end

      def destroy
        @note.destroy
        render json: { result: :ok }, status: :ok
      end

      private

      def find_note
        @note = character.notes.find(params[:id])
      end

      def character
        current_user.characters.find(params[:character_id])
      end

      def create_params
        params.expect(note: %i[value title]).to_h
      end
    end
  end
end
