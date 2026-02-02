# frozen_string_literal: true

module Frontend
  module Daggerheart
    module Characters
      class ProjectsController < Frontend::BaseController
        include Deps[
          add_project: 'commands.characters_context.daggerheart.projects.add',
          change_project: 'commands.characters_context.daggerheart.projects.change'
        ]
        include SerializeRelation
        include SerializeResource

        before_action :find_character
        before_action :find_project, only: %i[update destroy]

        def index
          serialize_relation(projects, ::Daggerheart::ProjectSerializer, :projects)
        end

        def create
          case add_project.call(project_params.merge(character: @character))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result } then serialize_resource(result, ::Daggerheart::ProjectSerializer, :project, {}, :created)
          end
        end

        def update
          case change_project.call(project_params.merge({ project: @project }))
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          in { result: result } then serialize_resource(result, ::Daggerheart::ProjectSerializer, :project)
          end
        end

        def destroy
          @project.destroy
          only_head_response
        end

        private

        def find_character
          @character = authorized_scope(Character.all).daggerheart.find(params[:character_id])
        end

        def find_project
          @project = @character.projects.find(params[:id])
        end

        def projects
          @character.projects
        end

        def project_params
          params.require(:project).permit!.to_h
        end
      end
    end
  end
end
