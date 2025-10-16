# frozen_string_literal: true

module Frontend
  module Homebrews
    module Domains
      class CopiesController < Frontend::BaseController
        include Deps[copy_daggerheart_domain: 'commands.homebrew_context.daggerheart.copy_domain']
        include SerializeResource

        before_action :find_domain

        def create
          case copy_service.call({ domain: @domain, user: current_user })
          in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
          else only_head_response
          end
        end

        private

        def find_domain
          @domain = domains_relation.where.not(user: current_user).find(params[:race_id])
        end

        def copy_service
          case params[:provider]
          when 'daggerheart' then copy_daggerheart_domain
          end
        end

        def domains_relation
          case params[:provider]
          when 'daggerheart' then ::Daggerheart::Homebrew::Domain
          else []
          end
        end
      end
    end
  end
end
