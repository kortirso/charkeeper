# frozen_string_literal: true

module Api
  module V1
    class CharactersController < Api::V1::BaseController
      include SerializeRelation
      include SerializeResource

      INDEX_SERIALIZER_FIELDS = %i[id name data rule_id].freeze
      SHOW_SERIALIZER_FIELDS = %i[id name data represented_data rule_id].freeze

      def index
        render json: serialize_relation(
          characters,
          CharacterSerializer,
          :characters,
          serializer_fields(CharacterSerializer, INDEX_SERIALIZER_FIELDS)
        ), status: :ok
      end

      def show
        render json: serialize_resource(
          character,
          CharacterSerializer,
          :character,
          serializer_fields(CharacterSerializer, SHOW_SERIALIZER_FIELDS)
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
end
