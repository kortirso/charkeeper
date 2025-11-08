# frozen_string_literal: true

module Frontend
  class UsersController < Frontend::BaseController
    include Deps[update_service: 'commands.users_context.update']
    include AuthkeeperDeps[fetch_session: 'services.fetch_session']

    def update
      case update_service.call(update_params.merge({ user: current_user }))
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      else only_head_response
      end
    end

    def destroy
      destroy_sessions
      UsersContext::RemoveProfileJob.perform_later(user_id: current_user.id)
      only_head_response
    end

    private

    def destroy_sessions
      current_user.sessions.delete_all
      cookies.delete(Authkeeper.configuration.access_token_name)
    end

    def update_params
      params.require(:user).permit!.to_h
    end
  end
end
