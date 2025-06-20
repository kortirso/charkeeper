# frozen_string_literal: true

module Frontend
  class UsersController < Frontend::BaseController
    include Deps[
      update_service: 'commands.users_context.update'
    ]

    def update
      case update_service.call(update_params.merge({ user: current_user }))
      in { errors: errors } then unprocessable_response(errors)
      else only_head_response
      end
    end

    private

    def update_params
      params.require(:user).permit!.to_h
    end
  end
end
