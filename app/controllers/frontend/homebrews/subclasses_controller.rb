# frozen_string_literal: true

module Frontend
  module Homebrews
    class SubclassesController < Frontend::BaseController
      include Deps[add_daggerheart_subclass: 'commands.homebrew_context.daggerheart.add_subclass']
      include SerializeResource

      before_action :find_subclass, only: %i[destroy]
      before_action :find_existing_characters, only: %i[destroy]

      def create
        case add_service.call(create_params.merge(user: current_user))
        in { errors: errors } then unprocessable_response(errors)
        in { result: result } then serialize_resource(result, serializer, :subclass, {}, :created)
        end
      end

      def destroy
        @subclass.destroy
        only_head_response
      end

      private

      def find_subclass
        @subclass = subclasses_relation.find_by!(id: params[:id], user_id: current_user.id)
      end

      def find_existing_characters
        subclasses = characters_relation.where(user_id: current_user.id).pluck(:data).pluck(:subclasses)
        return if subclasses.flat_map(&:values).exclude?(@subclass.id)

        unprocessable_response({ base: [t("frontend.homebrews.subclasses.#{params[:provider]}.character_exists")] })
      end

      def create_params
        params.require(:brewery).permit!.to_h
      end

      def add_service
        case params[:provider]
        when 'daggerheart' then add_daggerheart_subclass
        end
      end

      def serializer
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::SubclassSerializer
        end
      end

      def subclasses_relation
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::Subclass
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
