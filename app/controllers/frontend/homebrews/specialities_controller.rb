# frozen_string_literal: true

module Frontend
  module Homebrews
    class SpecialitiesController < Frontend::BaseController
      include Deps[add_daggerheart_speciality: 'commands.homebrew_context.daggerheart.add_speciality']
      include SerializeRelation
      include SerializeResource

      before_action :find_specialities, only: %i[index]
      before_action :find_speciality, only: %i[destroy]
      before_action :find_existing_characters, only: %i[destroy]

      def index
        serialize_relation(@specialities, serializer, :specialities)
      end

      def create
        case add_service.call(create_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result } then serialize_resource(result, serializer, :speciality, {}, :created)
        end
      end

      def destroy
        @speciality.destroy
        only_head_response
      end

      private

      def find_specialities
        @specialities = specialities_relation.where(user_id: current_user.id).distinct
      end

      def find_speciality
        @speciality = specialities_relation.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_existing_characters
        subclasses = characters_relation.where(user_id: current_user.id).pluck(:data).pluck(:subclasses)
        return if subclasses.flat_map(&:keys).exclude?(@speciality.id)

        unprocessable_response(
          { base: [t("frontend.homebrews.specialities.#{params[:provider]}.character_exists")] },
          [t("frontend.homebrews.specialities.#{params[:provider]}.character_exists")]
        )
      end

      def create_params
        params.require(:brewery).permit!.to_h
      end

      def add_service
        case params[:provider]
        when 'daggerheart' then add_daggerheart_speciality
        end
      end

      def serializer
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::SpecialitySerializer
        end
      end

      def specialities_relation
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::Speciality
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
