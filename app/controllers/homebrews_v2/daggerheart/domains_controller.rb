# frozen_string_literal: true

module HomebrewsV2
  module Daggerheart
    class DomainsController < Homebrews::BaseController
      include SerializeResource

      before_action :find_domain, only: %i[show]
      before_action :find_own_domain, only: %i[destroy]
      before_action :find_features, only: %i[show]
      before_action :find_another_domain, only: %i[copy]

      def show
        serialize_resource(
          @domain,
          ::HomebrewsV2::Daggerheart::DomainSerializer,
          :homebrew,
          {},
          :ok,
          { features: @features }
        )
      end

      def destroy
        @domain.discard
        only_head_response
      end

      def copy
        case HomebrewsV2Context::Import::Daggerheart::Domains::CopyCommand.new.call({
          domain: @domain, user: current_user
        })
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(
            result, ::HomebrewsV2::ListElementSerializer, :homebrew, {}, :created, { current_user_id: current_user.id }
          )
        end
      end

      private

      def find_domain
        @domain = ::Daggerheart::Homebrews::Domain.kept.find(params.expect(:id))
      end

      def find_own_domain
        @domain = ::Daggerheart::Homebrews::Domain.kept.find_by!(id: params.expect(:id), user_id: current_user.id)
      end

      def find_features
        @features = ::Daggerheart::Feat.where(origin_value: @domain.id).order(created_at: :asc)
      end

      def find_another_domain
        @domain =
          ::Daggerheart::Homebrews::Domain.kept.where.not(user_id: current_user.id).find(params.expect(:id))
      end

      def characters_relation
        ::Daggerheart::Character.where(user_id: current_user.id)
      end
    end
  end
end
