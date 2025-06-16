# frozen_string_literal: true

module Adminbook
  module Dnd2024
    module Characters
      class FeaturesController < Adminbook::BaseController
        def index
          @features = ::Dnd2024::Character::Feature.order(origin: :asc, origin_value: :asc, level: :asc)
        end

        def new; end

        def edit
          @feature = ::Dnd2024::Character::Feature.find(params[:id])
        end

        def create
          feature = ::Dnd2024::Character::Feature.new(transform_params(feature_params))
          feature.save
          redirect_to adminbook_characters_dnd2024_features_path
        end

        def update
          feature = ::Dnd2024::Character::Feature.find(params[:id])
          feature.update(transform_params(feature_params))
          redirect_to adminbook_characters_dnd2024_features_path
        end

        def destroy
          feature = ::Dnd2024::Character::Feature.find(params[:id])
          feature.destroy
          redirect_to adminbook_characters_dnd2024_features_path
        end

        private

        def transform_params(updating_params)
          new_variable = updating_params['eval_variables'].delete('new_variable')
          if new_variable.present?
            key, value = new_variable.split('-->')
            updating_params['eval_variables'][key] = value
          end
          updating_params['limit_refresh'] = nil if updating_params['limit_refresh'].blank?
          updating_params['options'] = updating_params['options'].blank? ? nil : JSON.parse(updating_params['options'])
          updating_params
        end

        def feature_params
          params
            .expect(
              dnd5_character_feature: [
                :slug, :origin, :origin_value, :level, :kind, :limit_refresh, :options, :options_type, :visible, :choose_once,
                { title: %i[en ru], description: %i[en ru], eval_variables: {} }
              ]
            )
        end
      end
    end
  end
end
