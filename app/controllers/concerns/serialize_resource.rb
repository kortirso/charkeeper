# frozen_string_literal: true

module SerializeResource
  extend ActiveSupport::Concern

  private

  def serialize_resource(resource, serializer, key, serialized_fields={}, status=:ok)
    return only_head_response if params[:only_head]

    data =
      if params[:only].blank?
        Panko::Response.create { |response| { key => response.serializer(resource, serializer, **serialized_fields) } }
      else
        Panko::Response.create { |response| { key => response.serializer(resource, serializer, **only_fields) } }
      end

    render json: data, status: status
  end

  def only_fields
    { only: params[:only].split(',').map(&:to_sym) }
  end
end
