# frozen_string_literal: true

module Frontend
  module Homebrews
    class RacesController < Frontend::BaseController
      include Deps[add_daggerheart_race: 'commands.homebrew_context.daggerheart.add_race']
      include SerializeRelation
      include SerializeResource

      before_action :find_races, only: %i[index]
      before_action :find_race, only: %i[destroy]
      before_action :find_existing_characters, only: %i[destroy]

      def index
        serialize_relation(@races, serializer, :races)
      end

      def create
        case add_service.call(create_params.merge(user: current_user))
        in { errors: errors } then unprocessable_response(errors)
        in { result: result } then serialize_resource(result, serializer, :race, {}, :created)
        end
      end

      def destroy
        @race.destroy
        only_head_response
      end

      private

      def find_races
        @races = races_relation.joins(:homebrews).where(homebrews: { user_id: current_user.id }).distinct
      end

      def find_race
        @race = races_relation.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_existing_characters
        return unless characters_relation.where(user_id: current_user.id).exists?(["data ->> 'heritage' = ?", @race.id])

        unprocessable_response({ base: [t("frontend.homebrews.races.#{params[:provider]}.character_exists")] })
      end

      def create_params
        params.require(:brewery).permit!.to_h
      end

      def add_service
        case params[:provider]
        when 'daggerheart' then add_daggerheart_race
        end
      end

      def serializer
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::RaceSerializer
        end
      end

      def races_relation
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::Race
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
