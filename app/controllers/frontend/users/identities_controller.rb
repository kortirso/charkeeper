# frozen_string_literal: true

module Frontend
  module Users
    class IdentitiesController < Frontend::BaseController
      def destroy
        current_user.identities.find(params[:id]).destroy
        only_head_response
      end
    end
  end
end
