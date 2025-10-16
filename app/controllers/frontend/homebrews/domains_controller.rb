# frozen_string_literal: true

module Frontend
  module Homebrews
    class DomainsController < Frontend::BaseController
      before_action :find_domain, only: %i[destroy]

      def destroy
        @domain.destroy
        only_head_response
      end

      private

      def find_domain
        @domain = domains_relation.find_by!(id: params[:id], user_id: current_user.id)
      end

      def domains_relation
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Homebrew::Domain
        else []
        end
      end

      def characters_relation
        case params[:provider]
        when 'daggerheart' then ::Daggerheart::Character
        end
      end
    end
  end
end
