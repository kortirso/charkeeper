# frozen_string_literal: true

module Frontend
  module Homebrews
    module Transformations
      class CopiesController < Frontend::BaseController
        include Deps[copy_daggerheart_transformation: 'commands.homebrew_context.daggerheart.copy_transformation']
        include SerializeResource

        before_action :find_transformation

        def create
          case copy_service.call({ transformation: @transformation, user: current_user })
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_transformation
          @transformation = transformations_relation.where.not(user: current_user).find(params[:race_id])
        end

        def copy_service
          case params[:provider]
          when 'daggerheart' then copy_daggerheart_transformation
          end
        end

        def transformations_relation
          case params[:provider]
          when 'daggerheart' then ::Daggerheart::Homebrew::Transformation
          else []
          end
        end
      end
    end
  end
end
