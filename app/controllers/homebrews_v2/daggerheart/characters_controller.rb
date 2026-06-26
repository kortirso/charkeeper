# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class CharactersController < Homebrews::BaseController
      include SerializeResource
      include SerializeRelation

      before_action :find_characters, only: %i[index]
      before_action :find_character, only: %i[show]
      before_action :find_features, only: %i[show]

      def index
        serialize_relation(
          @characters, ::HomebrewsV2::Daggerheart::CharacterSerializer, :homebrews, { except: %i[features] }
        )
      end

      def show
        serialize_resource(
          @character, ::HomebrewsV2::Daggerheart::CharacterSerializer, :homebrew, {}, :ok, { features: @features }
        )
      end

      private

      def find_characters
        @characters = characters_relation
      end

      def find_character
        @character = characters_relation.find(params.expect(:id))
      end

      def find_features
        @features = ::Daggerheart::Feat.where(origin_value: @character.id).includes(:items).order(created_at: :asc)
      end

      def characters_relation
        ::Daggerheart::Character.where(user_id: current_user.id)
      end
    end
  end
end
