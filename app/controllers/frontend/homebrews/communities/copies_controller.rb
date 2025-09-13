# frozen_string_literal: true

module Frontend
  module Homebrews
    module Communities
      class CopiesController < Frontend::BaseController
        include Deps[copy_daggerheart_community: 'commands.homebrew_context.daggerheart.copy_community']
        include SerializeResource

        before_action :find_community

        def create
          case copy_service.call({ community: @community, user: current_user })
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_community
          @community = communities_relation.where.not(user: current_user).find(params[:race_id])
        end

        def copy_service
          case params[:provider]
          when 'daggerheart' then copy_daggerheart_community
          end
        end

        def communities_relation
          case params[:provider]
          when 'daggerheart' then ::Daggerheart::Homebrew::Community
          else []
          end
        end
      end
    end
  end
end
