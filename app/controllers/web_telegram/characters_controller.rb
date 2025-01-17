# frozen_string_literal: true

module WebTelegram
  class CharactersController < WebTelegram::BaseController
    include SerializeRelation
    include SerializeResource

    INDEX_SERIALIZER_FIELDS = %i[id name index_data rule_id].freeze
    SHOW_SERIALIZER_FIELDS = %i[id name show_data rule_id].freeze

    def index
      render json: serialize_relation(
        characters,
        CharacterSerializer,
        :characters,
        { only: INDEX_SERIALIZER_FIELDS }
      ), status: :ok
    end

    def show
      render json: serialize_resource(
        character,
        CharacterSerializer,
        :character,
        { only: SHOW_SERIALIZER_FIELDS }
      ), status: :ok
    end

    private

    def characters
      current_user.characters
    end

    def character
      characters.find_by(id: params[:id])
    end
  end
end
