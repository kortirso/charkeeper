# frozen_string_literal: true

module Frontend
  module Homebrews
    class TransformationsController < Frontend::BaseController
      before_action :find_transformation, only: %i[destroy]
      before_action :find_existing_characters, only: %i[destroy]

      def destroy
        @transformation.destroy
        only_head_response
      end

      private

      def find_transformation
        @transformation = transformations_relation.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_existing_characters
        unless characters_relation.where(user_id: current_user.id).exists?(["data ->> 'transformation' = ?", @transformation.id])
          return
        end

        unprocessable_response(
          { base: [t("frontend.homebrews.transformations.#{params[:provider]}.character_exists")] },
          [t("frontend.homebrews.transformations.#{params[:provider]}.character_exists")]
        )
      end

      def transformations_relation
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::Transformation
        else []
        end
      end

      def characters_relation
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Character
        end
      end
    end
  end
end
