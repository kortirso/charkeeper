# frozen_string_literal: true

module Frontend
  module Characters
    class ResourcesController < Frontend::BaseController
      include SerializeResource
      include Deps[
        attach_resource: 'commands.resources_context.attach',
        refresh_resource: 'commands.resources_context.refresh'
      ]

      before_action :find_character
      before_action :find_custom_resource, only: %i[create]
      before_action :find_resource, only: %i[update destroy]

      def create
        case attach_resource.call(character: @character, custom_resource: @custom_resource)
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      def update
        case refresh_resource.call(resource_params.merge({ resource: @resource }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      def destroy
        @resource.destroy
        only_head_response
      end

      private

      def find_character
        @character = authorized_scope(Character.all).find(params[:character_id])
      end

      def find_custom_resource
        @custom_resource = @character.custom_resources.find(params[:resource_id])
      end

      def find_resource
        @resource = @character.resources.find(params[:id])
      end

      def resource_params
        params.require(:resource).permit!.to_h
      end
    end
  end
end
