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
        end

        private

        def update_params
          params
            .expect(
              dnd5_character_feature: [
                :slug, :race, :subrace, :level, :kind, :limit_refresh, :options,
                { title: %i[en ru], description: %i[en ru], eval_variables: {} }
              ]
            )
        end
      end
    end
  end
end
