# frozen_string_literal: true

module Frontend
  module Homebrews
    module Items
      class CopiesController < Frontend::BaseController
        include Deps[copy_daggerheart_item: 'commands.homebrew_context.daggerheart.copy_item']
        include SerializeResource

        before_action :find_item

        def create
          case copy_service.call({ item: @item, user: current_user })
          in { errors: errors } then unprocessable_response(errors)
          else only_head_response
          end
        end

        private

        def find_item
          @item = items_relation.where.not(user: current_user).find(params[:item_id])
        end

        def copy_service
          case params[:provider]
          when 'daggerheart' then copy_daggerheart_item
          end
        end

        def items_relation
          case params[:provider]
          when 'daggerheart' then ::Daggerheart::Item
          else []
          end
        end
      end
    end
  end
end
