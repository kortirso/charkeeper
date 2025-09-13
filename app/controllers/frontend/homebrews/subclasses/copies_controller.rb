# frozen_string_literal: true

module Frontend
  module Homebrews
    module Subclasses
      class CopiesController < Frontend::BaseController
        include Deps[copy_daggerheart_subclass: 'commands.homebrew_context.daggerheart.copy_subclass']
        include SerializeResource

        before_action :find_subclass

        def create
          case copy_service.call({ subclass: @subclass, user: current_user })
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_subclass
          @subclass = subclasses_relation.where.not(user: current_user).find(params[:subclass_id])
        end

        def copy_service
          case params[:provider]
          when 'daggerheart' then copy_daggerheart_subclass
          end
        end

        def subclasses_relation
          case params[:provider]
          when 'daggerheart' then ::Daggerheart::Homebrew::Subclass
          else []
          end
        end
      end
    end
  end
end
