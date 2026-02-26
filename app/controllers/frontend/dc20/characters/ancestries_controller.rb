# frozen_string_literal: true

module Frontend
  module Dc20
    module Characters
      class AncestriesController < Frontend::BaseController
        before_action :find_character

        def index
          render json: ancestries, status: :ok
        end

        private

        def find_character
          @character = authorized_scope(Character.all).dc20.find(params[:character_id])
        end

        def ancestries
          @character
            .feats.joins(:feat).where(feats: { origin: 0 })
            .pluck('feats.origin_value', 'feats.slug')
            .group_by { |item| item[0] }.transform_values { |value| value.map { |item| item[1] } }
        end
      end
    end
  end
end
