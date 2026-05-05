# frozen_string_literal: true

module Frontend
  module Characters
    class CustomResourcesController < Frontend::BaseController
      include SerializeRelation
      include SerializeResource
      include Deps[
        add_resource: 'commands.resources_context.add',
        change_resource: 'commands.resources_context.change'
      ]

      before_action :find_character
      before_action :find_custom_resource, only: %i[update destroy]

      def index
        serialize_relation(custom_resources, ::CustomResourceSerializer, :custom_resources)
      end

      def create
        case add_resource.call(resource_params.merge({ resourceable: @character }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::CustomResourceSerializer, :custom_resource, {}, :created)
        end
      end

      def update
        case change_resource.call(resource_params.merge({ custom_resource: @custom_resource }))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        else only_head_response
        end
      end

      def destroy
        @custom_resource.destroy
        only_head_response
      end

      private

      def custom_resources
        @character.custom_resources
      end

      def find_character
        @character = authorized_scope(Character.all).find(params[:character_id])
      end

      def find_custom_resource
        @custom_resource = @character.custom_resources.find(params[:id])
      end

      def resource_params
        params.require(:resource).permit!.to_h
      end
    end
  end
end
