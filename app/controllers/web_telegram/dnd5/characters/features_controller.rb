# frozen_string_literal: true

module WebTelegram
  module Dnd5
    module Characters
      class FeaturesController < WebTelegram::BaseController
        before_action :find_character

        def index
          render json: {
            features: ::Dnd5::Characters::FeaturesListService.new.call(character: @character)
          }, status: :ok
        end

        private

        def find_character
          @character = current_user.characters.dnd5.find(params[:character_id])
        end
      end
    end
  end
end
