# frozen_string_literal: true

module Adminbook
  module Characters
    module Dnd5
      class FeaturesController < Adminbook::BaseController
        def index
          @features = ::Dnd5::Character::Feature.order(origin: :asc, origin_value: :asc, level: :asc)
        end

        def new; end

        def edit
          @feature = ::Dnd5::Character::Feature.find(params[:id])
        end

        def create
          feature = ::Dnd5::Character::Feature.new(transform_params(feature_params))
          feature.save
          redirect_to adminbook_characters_dnd5_features_path
        end

        def update
          feature = ::Dnd5::Character::Feature.find(params[:id])
          feature.update(transform_params(feature_params))
          redirect_to adminbook_characters_dnd5_features_path
        end

        def destroy
          feature = ::Dnd5::Character::Feature.find(params[:id])
          feature.destroy
          redirect_to adminbook_characters_dnd5_features_path
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
                :slug, :origin, :origin_value, :level, :kind, :limit_refresh, :options, :options_type, :visible,
                { title: %i[en ru], description: %i[en ru], eval_variables: {} }
              ]
            )
        end
      end
    end
  end
end
