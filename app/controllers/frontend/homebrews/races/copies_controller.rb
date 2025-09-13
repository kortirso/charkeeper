# frozen_string_literal: true

module Frontend
  module Homebrews
    module Races
      class CopiesController < Frontend::BaseController
        include Deps[copy_daggerheart_race: 'commands.homebrew_context.daggerheart.copy_race']
        include SerializeResource

        before_action :find_race

        def create
          case copy_service.call({ race: @race, user: current_user })
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_race
          @race = races_relation.where.not(user: current_user).find(params[:race_id])
        end

        def copy_service
          case params[:provider]
          when 'daggerheart' then copy_daggerheart_race
          end
        end

        def races_relation
          case params[:provider]
          when 'daggerheart' then ::Daggerheart::Homebrew::Race
          else []
          end
        end
      end
    end
  end
end
