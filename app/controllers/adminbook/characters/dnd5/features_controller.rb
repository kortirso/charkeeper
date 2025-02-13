# frozen_string_literal: true

module Adminbook
  module Characters
    module Dnd5
      class FeaturesController < Adminbook::BaseController
        def index
          @features = ::Dnd5::Character::Feature.order(origin: :asc, origin_value: :asc, level: :asc)
        end

        def edit
          @feature = ::Dnd5::Character::Feature.find(params[:id])
        end

        def update
          @feature = ::Dnd5::Character::Feature.find(params[:id])

          ap update_params
        end

        private

        def update_params
          params
            .require(:dnd5_character_feature)
            .permit(
              :slug, :race, :subrace, :level, :kind, :limit_refresh, :options,
              title: [:en, :ru], description: [:en, :ru], eval_variables: {}
            )
        end
      end
    end
  end
end
