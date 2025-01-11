# frozen_string_literal: true

module Api
  module V1
    class CharactersController < Api::V1::BaseController
      include SerializeRelation

      def index
        render json: serialize_relation(characters, CharacterSerializer, :characters), status: :ok
      end

      private

      def characters
        current_user.characters
      end
    end
  end
end
