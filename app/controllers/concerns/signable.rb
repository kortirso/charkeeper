# frozen_string_literal: true

module Signable
  extend ActiveSupport::Concern

  private

  def auth_response(user_session)
    access_token = Authkeeper::Container.resolve('services.generate_token').call(user_session: user_session)[:result]
    render json: {
      access_token: access_token,
      locale: user_session.user.locale,
      username: user_session.user.username,
      admin: user_session.user.admin?
    }, status: :created
  end
end
