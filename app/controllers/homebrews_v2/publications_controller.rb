# frozen_string_literal: true

module HomebrewsV2
  class PublicationsController < HomebrewsV2::BaseController
    include Deps[
      create_command: 'commands.homebrews_v2_context.publications.create'
    ]
    include SerializeRelation
    include SerializeResource

    before_action :find_publications, only: %i[index]

    def index
      serialize_relation(@publications, ::HomebrewsV2::PublicationSerializer, :publications)
    end

    def create
      case create_command.call(publication_params.merge({ user: current_user }))
      in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
      in { result: result }
        serialize_resource(result, ::HomebrewsV2::PublicationSerializer, :publication, {}, :created)
      end
    end

    private

    def find_publications
      @publications =
        ::Homebrew::Publication.where(user_id: current_user.id, parent_type: params[:type]).order(created_at: :desc).first(3)
    end

    def publication_params
      params.permit!.to_h
    end
  end
end
