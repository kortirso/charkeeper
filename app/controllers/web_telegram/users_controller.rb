# frozen_string_literal: true

module WebTelegram
  class UsersController < WebTelegram::BaseController
    include Deps[
      update_service: 'commands.users_context.update'
    ]

    def update
      case update_service.call(update_params.merge({ user: current_user }))
      in { errors: errors } then render json: { errors: errors }, status: :unprocessable_entity
      else render json: { result: :ok }, status: :ok
      end
    end

    private

    def update_params
      params.require(:user).permit!.to_h
    end
  end
end
