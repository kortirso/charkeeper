# frozen_string_literal: true

module Frontend
  module Dc20
    module Characters
      class AncestriesController < Frontend::Dc20::BaseController
        before_action :find_character

        def index
          render json: ancestries, status: :ok
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dc20.find(params.expect(:character_id))
        end

        def ancestries
          ancestry_features = @character.data.ancestry_features
          @character
            .feats.joins(:feat).where(feats: { origin: 0 })
            .pluck('feats.origin_value', 'feats.slug')
            .group_by { |item| item[0] }
            .transform_values { |value| value.flat_map { |item| [item[1]] * (ancestry_features[item[1]] || 1) } }
        end
      end
    end
  end
end
