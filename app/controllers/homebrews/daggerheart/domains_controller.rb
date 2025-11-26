# frozen_string_literal: true

module Homebrews
  module Daggerheart
    class DomainsController < Homebrews::BaseController
      include Deps[
        add_daggerheart_domain: 'commands.homebrew_context.daggerheart.add_domain',
        change_daggerheart_domain: 'commands.homebrew_context.daggerheart.change_domain'
      ]
      include SerializeRelation
      include SerializeResource

      before_action :find_domains, only: %i[index]
      before_action :find_domain, only: %i[show update destroy]
      before_action :find_features, only: %i[index show]
      before_action :find_feature_bonuses, only: %i[index show]

      def index
        serialize_relation(
          @domains,
          ::Homebrews::Daggerheart::DomainSerializer,
          :domains,
          {},
          { features: @features, bonuses: @bonuses }
        )
      end

      def show
        serialize_resource(
          @domain, ::Homebrews::Daggerheart::DomainSerializer, :domain, {}, :ok, { features: @features, bonuses: @bonuses }
        )
      end

      def create
        case add_daggerheart_domain.call(domain_params.merge(user: current_user))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::DomainSerializer, :domain, {}, :created)
        end
      end

      def update
        case change_daggerheart_domain.call(domain_params.merge(domain: @domain))
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, ::Homebrews::Daggerheart::DomainSerializer, :domain, {}, :ok)
        end
      end

      def destroy
        @domain.destroy
        only_head_response
      end

      private

      def find_domains
        @domains = ::Daggerheart::Homebrew::Domain.where(user_id: current_user.id).order(created_at: :desc)
      end

      def find_features
        @features = ::Daggerheart::Feat.where(origin_value: @domains ? @domains.pluck(:id) : @domain.id).order(created_at: :asc)
      end

      def find_feature_bonuses
        @bonuses = Character::Bonus.where(bonusable: @features.pluck(:id))
      end

      def find_domain
        @domain = ::Daggerheart::Homebrew::Domain.find_by!(id: params[:id], user_id: current_user.id)
      end

      def domain_params
        params.require(:brewery).permit!.to_h
      end
    end
  end
end
