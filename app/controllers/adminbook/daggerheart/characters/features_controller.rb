# frozen_string_literal: true

module Adminbook
  module Daggerheart
    module Characters
      class FeaturesController < Adminbook::BaseController
        def index
          @features = ::Daggerheart::Character::Feature.order(origin: :asc, origin_value: :asc, level: :asc)
        end

        def new; end

        def edit
          @feature = ::Daggerheart::Character::Feature.find(params[:id])
        end

        def create
          feature = ::Daggerheart::Character::Feature.new(transform_params(feature_params))
          feature.save
          redirect_to adminbook_characters_Daggerheart_features_path
        end

        def update
          feature = ::Daggerheart::Character::Feature.find(params[:id])
          feature.update(transform_params(feature_params))
          redirect_to adminbook_characters_Daggerheart_features_path
        end

        def destroy
          feature = ::Daggerheart::Character::Feature.find(params[:id])
          feature.destroy
          redirect_to adminbook_characters_Daggerheart_features_path
        end

        private

        def transform_params(updating_params)
          updating_params['description_eval_variables'] =
            JSON.parse(updating_params['description_eval_variables'].gsub(' =>', ':').gsub('nil', 'null'))
          updating_params['eval_variables'] =
            JSON.parse(updating_params['eval_variables'].gsub(' =>', ':').gsub('nil', 'null'))
          updating_params['limit_refresh'] = nil if updating_params['limit_refresh'].blank?
          updating_params
        end

        def feature_params
          params
            .expect(
              Daggerheart_character_feature: [
                :slug, :origin, :origin_value, :level, :kind, :limit_refresh, :options, :options_type, :visible, :choose_once,
                :description_eval_variables, :eval_variables, { title: %i[en ru], description: %i[en ru] }
              ]
            )
        end
      end
    end
  end
end
